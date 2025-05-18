import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule,MatIconModule,RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
features = [
    {
      icon: 'security',
      title: 'Real-Time Detection',
      description: 'Instantly identify threats with our advanced LLM-powered algorithms.'
    },
    {
      icon: 'insights',
      title: 'Interactive Analytics',
      description: 'Visualize and analyze threats with dynamic charts and reports.'
    },
    {
      icon: 'shield',
      title: 'Proactive Defense',
      description: 'Neutralize threats before they impact your systems.'
    },
    {
      icon: 'cloud',
      title: 'Cloud Integration',
      description: 'Seamlessly integrate with your existing cloud infrastructure.'
    }
  ];

  testimonials = [
    {
      quote: "This system reduced our incident response time by 80%.",
      author: "Jane Smith, CISO at TechCorp"
    },
    {
      quote: "The most intuitive threat detection interface I've used.",
      author: "John Doe, Security Engineer at SecureNet"
    }
  ];
}
