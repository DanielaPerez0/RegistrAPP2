import { Component, OnInit } from '@angular/core';
import { AuthServiceService } from '../auth-service.service';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import {HttpClient} from '@angular/common/http'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{
  email :any
  characters = []

  constructor(private authService:AuthServiceService,private router: Router, private http: HttpClient) {

  }
  ngOnInit(): void {

    this.http.get<any>("https://rickandmortyapi.com/api/character")
    .subscribe(res =>{
      console.log(res);
      this.characters = res.results;
    })


    this.authService.getProfile().then(user => {
      this.email = user?.email;
      console.log(user?.email);
    }).catch(error => {
      console.error('Error getting user profile:', error);
    });
    
  }
 signOut(){
  this.authService.signOut().then(() =>{
    this.router.navigate(['/landing'])
  })
 }




}
