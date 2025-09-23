import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { FooterComponent } from "../../core/layout/footer/footer.component";

@Component({
  selector: 'app-app-home',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, FooterComponent],
  templateUrl: './app-home.component.html',
  styleUrl: './app-home.component.less'
})
export class AppHomeComponent {

}
