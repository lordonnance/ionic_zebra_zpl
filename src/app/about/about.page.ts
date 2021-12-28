import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../services/global.service';
import { ScanService } from '../services/scan.service';

import { Deploy } from 'cordova-plugin-ionic/dist/ngx';
import { AlertController, LoadingController } from '@ionic/angular';
import { BootService } from '../services/boot.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  isNewUpdateAvailable: boolean = false
  updatePercentDone: number = 0

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private globalService: GlobalService,
    public bootService: BootService,
    private scanService: ScanService,
    private deploy: Deploy
  ) {}

  async ngOnInit() {
    console.info ("--- about ngOnInit ---")
    
    const newUpdateAvailable = await this.deploy.checkForUpdate()
    console.log ("newUpdateAvailable", newUpdateAvailable)

    this.isNewUpdateAvailable = newUpdateAvailable.available
  }

  // Downlaod, extract the new currently available version from AppFlow and reload the app
  async performAutomaticUpdate() {
    console.info ("--- performAutomaticUpdate ---")
    const loading = await this.loadingCtrl.create({})
    await loading.present()

    try {
      const currentVersion = await this.deploy.getCurrentVersion();
      const resp = await this.deploy.sync({updateMethod: 'auto'}, percentDone => {
        console.log(`Update is ${percentDone}% done!`);
        this.updatePercentDone = percentDone
      });
      if (!currentVersion || currentVersion.versionId !== resp.versionId){
        // We found an update, and are in process of redirecting you since you put auto!
      }else{
        // No update available
      }
    } catch (err) {
      // We encountered an error.
    }

    loading.dismiss()
    this.updatePercentDone = 0
   }

  // Log out the user from the app and erase user Credentials in Ionic local storage
  logout() {
    // Reset scanService attributes
    this.scanService.resetScanAttributes()

    // Logout from firebase and go to login page
    this.globalService.logout()
  }
}
