// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';
// import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
// import { RouterLinkActive, RouterModule } from '@angular/router';

// @Component({
//   selector: 'app-navbar',
//   imports: [CommonModule,MatIconModule,RouterLinkActive,RouterModule],
//   templateUrl: './navbar.component.html',
//   styleUrl: './navbar.component.scss'
// })
// export class NavbarComponent {
//   isMenuOpen = false;

//   toggleMenu() {
//     this.isMenuOpen = !this.isMenuOpen;
//   }
// }


import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLinkActive, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isDropdownOpen = false;
  @ViewChild('dropdown', { static: false }) dropdownRef!: ElementRef;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('click', this.handleClickOutside.bind(this));
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('click', this.handleClickOutside.bind(this));
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleDropdown(event: MouseEvent) {
    this.isDropdownOpen = !this.isDropdownOpen;
    event.stopPropagation();
  }

  logout() {
    this.isDropdownOpen = false;
    this.router.navigate(['/']);
  }

  private handleClickOutside(event: MouseEvent) {
    if (this.isDropdownOpen && this.dropdownRef && !this.dropdownRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }
}