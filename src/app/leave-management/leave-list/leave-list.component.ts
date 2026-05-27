import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule],
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.css']
})
export class LeaveListComponent implements OnInit, AfterViewInit {

  leaves: any[] = [];
  allLeaves: any[] = [];

  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  role: string = '';
  userName: string = '';

  filters = {
    leaveType: '',
    fromDate: '',
    toDate: '',
    status: ''
  };

  showPopup = false;
  selectedLeave: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.role = localStorage.getItem('role') || '';
    this.userName = localStorage.getItem('userName') || '';

    this.loadLeaves();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  pageIndex = 0;
pageSize = 10;

getPaginatedData() {
  const start = this.pageIndex * this.pageSize;
  return this.dataSource.data.slice(start, start + this.pageSize);
}

onPageChange(event: any) {
  this.pageIndex = event.pageIndex;
  this.pageSize = event.pageSize;
}

  // LOAD DATA
  loadLeaves() {
    this.http.get<any>('http://localhost:5000/api/leave/all')
      .subscribe({
        next: (res) => {

          let data = res.data || [];

          if (this.role === 'employee') {
            this.allLeaves = data.filter((l: any) =>
              l?.employeeName === this.userName
            );
          } else {
            this.allLeaves = data;
          }

          this.leaves = [...this.allLeaves];

          //   paginator
          this.dataSource.data = this.leaves;

        },
        error: () => {
          Swal.fire('Error', 'Failed to load leaves', 'error');
        }
      });
  }

  // FILTER
  applyFilters() {
    const filtered = this.allLeaves.filter(l => {

      const matchType = this.filters.leaveType
        ? l.leaveType?.toLowerCase().includes(this.filters.leaveType.toLowerCase())
        : true;

      const matchStatus = this.filters.status
        ? l.status === this.filters.status
        : true;

      const leaveFrom = new Date(l.fromDate);
      const leaveTo = new Date(l.toDate);

      const filterFrom = this.filters.fromDate ? new Date(this.filters.fromDate) : null;
      const filterTo = this.filters.toDate ? new Date(this.filters.toDate) : null;

      const matchDate =
        (!filterFrom || leaveFrom >= filterFrom) &&
        (!filterTo || leaveTo <= filterTo);

      return matchType && matchStatus && matchDate;
    });

    // datasource
this.pageIndex = 0;
this.dataSource.data = filtered;  }

  openPopup(leave: any) {
    this.selectedLeave = leave;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.selectedLeave = null;
  }

  approveLeave(id: string) {
    this.http.put(`http://localhost:5000/api/leave/status/${id}`, {
      status: 'Approved'
    }).subscribe(() => {
      Swal.fire('Success', 'Leave Approved', 'success');
      this.loadLeaves();
    });
  }

  rejectLeave(id: string) {
    Swal.fire({
      title: 'Enter Denial Reason',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      preConfirm: (reason) => {
        if (!reason) {
          Swal.showValidationMessage('Reason is required');
        }
        return reason;
      }
    }).then(result => {

      if (result.isConfirmed) {
        this.http.put(`http://localhost:5000/api/leave/status/${id}`, {
          status: 'Rejected',
          denialReason: result.value
        }).subscribe(() => {
          Swal.fire('Rejected', 'Leave Rejected', 'success');
          this.loadLeaves();
        });
      }

    });
  }

  goToAdd() {
    this.router.navigate(['/leave/add']);
  }
}