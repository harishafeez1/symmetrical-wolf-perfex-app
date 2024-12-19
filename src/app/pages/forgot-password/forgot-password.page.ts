import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  error = false;
  credentials: FormGroup;
 
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    public authService: AuthenticationService,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController,
    public toastController: ToastController,
    private mpcToast: MpcToastService,
  ) {
  }
 
  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
 
  async forgotPassword() {
    const loading = await this.loadingController.create();
    await loading.present();
    const formData = new FormData();
    formData.append('email', this.credentials.value.email);
    this.authService.forgotPassword(formData).subscribe({
      next: async (res:any) => {
        await loading.dismiss();
        if(res.status === true){
          this.credentials.reset();
          this.mpcToast.show(res?.message ?? 'Something went Wrong Please Try Again Later.');
          this.router.navigate(['login']);
        }  else{
          this.mpcToast.show(res?.message ?? 'Something went Wrong Please Try Again Later.', 'danger');
        }      
        
      }, error: async (res) => {
        await loading.dismiss();
        this.mpcToast.show(res?.message ?? 'Something went Wrong Please Try Again Later.','danger');
      }
    });
  }

  // Easy access for form fields
  get email() {
    return this.credentials.get('email');
  }
}
