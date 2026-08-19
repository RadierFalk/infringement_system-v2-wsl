import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { HomeComponent } from './home/home.component';
import { ShellComponent } from './shell/shell.component';

@NgModule({
  declarations: [ShellComponent, HomeComponent],
  imports: [SharedModule],
  exports: [ShellComponent],
})
export class LayoutModule {}
