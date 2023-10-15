import { Component, OnInit } from '@angular/core';
import {UnsubscribeOnDestroyAdapter} from '../../core/unsubscribe-on-destroy-adapter';
import {AuthService} from '../../core/auth.service';
import {LoggerService} from '../../core/logger.service';
import {VwUser} from '../../core/data/vw-user';
import {AdmApp} from '../../core/data/adm-app';
import {Observable} from 'rxjs';

import {environment} from '../../../environments/environment';
import {SystemService} from '../../core/system.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends UnsubscribeOnDestroyAdapter implements OnInit {

  me: VwUser = {} as VwUser;
  apps$: Observable<AdmApp[]>;

  appVersion = environment.APP_VERSION;

  constructor(private auth: AuthService, private logger: LoggerService,
              private system: SystemService) {
    super();
    this.subs.sink = this.auth.getCurrentUser$().subscribe(u => {
      // console.log('MainMenu::subUser new user', u);
      this.me = u;
    });
    this.apps$ = this.system.getApps();
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.auth.logout(true);
  }

}
