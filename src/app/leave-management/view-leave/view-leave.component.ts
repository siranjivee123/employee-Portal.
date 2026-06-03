import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-leave',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-leave.component.html'
})
export class ViewLeaveComponent {

  leave: any = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    console.log("ID:", id);

    this.http.get(`http://localhost:5000/api/leaves/${id}`)
      .subscribe({
        next: (res: any) => {
          console.log("Response:", res);
          this.leave = res.data;  
        },
        error: (err) => {
          console.error("Error:", err);
        }
      });
  }
}