import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Event, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { DOCUMENT, PlatformLocation } from '@angular/common';

import { SessionService } from './core/service/session-service/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  currentUrl: string;

  constructor(public _router: Router,
    location: PlatformLocation,
    private sessionService: SessionService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,) {
    this._router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationStart) {
        this.currentUrl = routerEvent.url.substring(
          routerEvent.url.lastIndexOf('/') + 1
        );
      }
      if (routerEvent instanceof NavigationEnd) {
      }
      window.scrollTo(0, 0);
    });
  }


  ngOnInit(): void {
    this.changeFavicon('assets/images/favicon.ico');
  }

  changeFavicon(url: string): void {
    const link: HTMLLinkElement = this.document.querySelector("#favicon");
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = url;
    this.renderer.appendChild(this.document.head, link);
  }
}
