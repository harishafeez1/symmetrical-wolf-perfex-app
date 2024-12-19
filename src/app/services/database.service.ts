import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';

const DB_CHAT = 'mychatdb';

export interface Chat {
  id: number,
  sender: string,
  message: string
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  

  chat: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  constructor() { }

  async initializePlugin(){
    const plt = Capacitor.getPlatform();
    console.log('plt =>', plt);
    if(plt !== 'web') {
        this.db = await this.sqlite.createConnection(
          DB_CHAT,
          false,
          'no-encryption',
          1,
          false
        );
    
        await this.db.open();

        const schema = `CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT NOT NULL,
        message TEXT NOT NULL
        )`;
    
        await this.db.execute(schema);
        this.loadChats();
    }


  }

  async loadChats(){
    const plt = Capacitor.getPlatform();
    if(plt !== 'web'){
      const chats = await this.db.query('SELECT * FROM chats');
      this.chat.next(chats);
    }
  }

  async addChat(sender: string, msg: string){
    const plt = Capacitor.getPlatform();
    if(plt !== 'web'){
      const query = `INSERT INTO chats (sender, message) VALUES (?, ?)`;
      const result = await this.db.query(query, [sender, msg]);
      // this.loadChats();
      return result;
    }
  }
  async removeChat(){
    const plt = Capacitor.getPlatform();
    if(plt !== 'web'){
      const query = `DELETE FROM chats`;
      const result = await this.db.query(query);
      this.chat.next([]);
      return result;
    }
  }
}
