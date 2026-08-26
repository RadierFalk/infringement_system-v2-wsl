import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-occurrences',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './occurrences.component.html',
  styleUrls: ['./occurrences.component.scss'],
})
export class OccurrencesComponent { }