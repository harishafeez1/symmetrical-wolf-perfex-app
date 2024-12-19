import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  showPassword = false;
  error = false;
  credentials: UntypedFormGroup;
 
  constructor(
    private fb: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    public authService: AuthenticationService,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController,
    public toastController: ToastController
  ) {
  }
 
  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      if(this.router.getCurrentNavigation().extras.state) {
        const data = this.router.getCurrentNavigation().extras.state;
        if(data.is_demo) {
          this.credentials.patchValue({
            email: 'john@myperfexcrm.com',
            password: '12345678'
          });
          this.login();
        }     
      }
    });
  }
 
  async login() {
    const loading = await this.loadingController.create();
    await loading.present();
    const formData = new FormData();
    formData.append('email', this.credentials.value.email);
    formData.append('password', this.credentials.value.password);

    this.authService.login(formData).subscribe({
      next: async (res) => {
        await loading.dismiss();        
        this.router.navigateByUrl('/admin/dashboard', { replaceUrl: true });
        window.dispatchEvent(new CustomEvent('admin:loggedIn'));
      }, error: async (res) => {
        await loading.dismiss();
        this.error = (res?.error?.message ?? 'Something went Wrong Please Try Again Later.');
      }
    });
  }

  // Easy access for form fields
  get email() {
    return this.credentials.get('email');
  }
  
  get password() {
    return this.credentials.get('password');
  }
}
