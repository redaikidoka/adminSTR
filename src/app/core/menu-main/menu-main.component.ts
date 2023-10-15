import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {UnsubscribeOnDestroyAdapter} from '../unsubscribe-on-destroy-adapter';

import {AuthService} from '../auth.service';
import {UserService} from '../user.service';
import {LoggerService} from '../logger.service';

import {VwUser} from '../data/vw-user';

import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-menu-main',
  templateUrl: './menu-main.component.html',
  styleUrls: ['./menu-main.component.scss']
})
export class MenuMainComponent extends UnsubscribeOnDestroyAdapter {
  // @Input() mainInfo: string;
  // @Input() mainTip: string;
  // @Input() subInfo: string;
  // @Input() subTip: string;
  // @Input() iconPath: string;
  // @Input() iconToolTip: string;
  //
  // @Input() matIcon: string;
  // @Input() matIconToolTip: string;

  @Output() clickedIcon: EventEmitter<any> = new EventEmitter();

  // @ViewChild(MatMenuTrigger, {static: true}) userMenu: MatMenuTrigger = new MatMenuTrigger();

  me$: Observable<VwUser> = this.auth.getCurrentUser$();
  // me: VwUser | undefined;
  // notifications: UsrNotify[];
  unread: number = 0;

  isProduction: boolean = true;

  adminIcon: string;
  sysAdminIcon: string;

  constructor(private router: Router, private auth: AuthService,
              private logger: LoggerService, private snackBar: MatSnackBar,
              private userService: UserService
) {
    super();

    this.isProduction = this.auth.isProduction();

    // this.subs.sink = this.userService.notifications.subscribe(notes => {
    //   // console.log('MainMenu::subnotify loaded notificatiosn', notes);
    //   this.notifications = notes;
    //   if (notes) {
    //     this.unread = (notes.filter(n => !n.isRead)).length;
    //   } else {
    //     this.unread = 0;
    //   }
    // });

    this.adminIcon = this.userService.userIcon(200);
    this.sysAdminIcon  = this.userService.userIcon(13);
  }

  // openYouMenu(): void {
  //   this.userMenu.openMenu();
  // }

  // doNotify(n: UsrNotify) {
  //   // console.log('Mainmenu::donotify', n);
  //   if (!n.isRead) {
  //     this.snackBar.open('Marking Done', 'yay', {duration: 3000});
  //     this.subs.sink = this.userz.readNotification(n.idNotify).subscribe(r => {
  //       console.log('mainmenu::readNotificationn', r);
  //       this.doLinkedAction(n.linkedObject, n.linkedId, n.linkedUser);
  //     });
  //     // n.isRead = true;
  //   } else {
  //     this.doLinkedAction(n.linkedObject, n.linkedId, n.linkedUser);
  //   }
  //
  //
  // }

  // private doLinkedAction(object: number, id: number, idUser: number) {
  //   if (!id || !object) {
  //     console.warn('NNo linkned object/id');
  //     return;
  //   }
  //
  //   switch (object) {
  //     case 1:
  //       this.strService.viewSTRDirect(id);
  //       break;
  //
  //     case 2:
  //       break;
  //     default:
  //       this.logger.logErr(this.me, 'MainMenu::doNotify', 'no known object', 'Couldn\'t launch the Notification - No ID :(');
  //       break;
  //   }
  //   // }
  //
  //
  // }

  // markNotificationsDone() {
  //   this.subs.sink = this.userz.readAllNotifications(this.me.idAdmUser, this.auth.getAppId()).subscribe(
  //     r => {
  //       console.log('TODO:: Mainmenu::Notifications marked Done!', r);
  //       this.userz.loadNotify(true);
  //       this.snackBar.open('All notifications marked read', '', {duration: 1000});
  //     }
  //   );
  //
  // }
  //
  // deleteAllNotifications() {
  //   window.alert('Feature coming soon!');
  // }

  iconClick(event: any): void {
    console.log('icon Clicked!');
    this.clickedIcon.emit(event);
  }

  logout(): void {
    this.auth.logout();
  }


  menuColor(): string {
    // if (!environment.production) {
    //   return 'accent';
    // }

    return 'primary';
  }

  userTypeIcon(): string {
    return this.userService.getUserTypeIcon();
  }

}
