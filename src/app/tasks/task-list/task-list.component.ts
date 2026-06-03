import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// Angular Material
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    RouterModule,
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, AfterViewInit {

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  displayedColumns: string[] = [
    'sno',
    'ticket',
    'description',
    'project',
    'shift',
    'assignedBy',
    'effort',
    'date',
    'status',
    'actions'
  ];

  tasks: any[] = [];
  dataSource = new MatTableDataSource<any>();

  searchText = '';
  selectedDate = '';
  selectedProject = '';
  sortOption = '';

  showPopup = false;
  selectedTask: any = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /*ngOnInit() {
    this.loadTasks();

    // safer filter setup
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return (data.ticket || '').toLowerCase().includes(filter);
    };
  }*/
role: string = '';
userId: string = '';
ngOnInit() {

  this.role = (localStorage.getItem('role') || '').toLowerCase();
  this.userId = localStorage.getItem('employeeId') || '';

   if (!this.role || !this.userId) {
    Swal.fire('Error', 'Session expired. Please login again.');
    this.router.navigate(['/login']);
    return;
  }

  this.loadTasks();

  this.dataSource.filterPredicate = (data: any, filter: string) => {
    return (data.ticket || '').toLowerCase().includes(filter);
  };
}


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // 
  // LOAD TASKS 
  // 
  loadTasks() {
this.http.get<any>(
  `http://localhost:5000/api/tasks/all?role=${this.role}&userId=${this.userId}`
)      .subscribe({
        next: (res) => {

          console.log('TASK API RESPONSE:', res);

          const rawTasks =
            res?.tasks ??
            res?.data ??
            (Array.isArray(res) ? res : []);

          this.tasks = (rawTasks || []).map((task: any) => ({
            ...task,
            createdAt: task.createdAt || task.date || new Date()
          }));

          this.sortTasksByLatest();

          this.dataSource.data = this.tasks;
          // timing 
          setTimeout(() => {
            if (this.paginator) {
              this.dataSource.paginator = this.paginator;
            }
          });
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'Failed to load tasks', 'error');
        }
      });
  }

  //
  // SORT
  // 
  sortTasksByLatest() {
    this.tasks.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  
  // FILTER 
  
  applyFilter() {

    let data = [...this.tasks];

    if (this.searchText) {
      data = data.filter(t =>
        (t.ticket || '').toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    if (this.selectedDate) {
      data = data.filter(t =>
        new Date(t.createdAt).toISOString().split('T')[0] === this.selectedDate
      );
    }

    // if (this.selectedProject) {
    //   data = data.filter(t =>
    //     (t.project || '')
    //       .toString()
    //       .toLowerCase()
    //       .includes(this.selectedProject.toLowerCase())
    //   );
    // }
if (this.selectedProject) {
  data = data.filter(t =>
    (t.project?.name || '')
      .toLowerCase()
      .includes(this.selectedProject.toLowerCase())
  );
}
    switch (this.sortOption) {
      case 'ticket-asc':
        data.sort((a, b) =>
          (a.ticket || '').localeCompare(b.ticket || '')
        );
        break;
      case 'ticket-desc':
        data.sort((a, b) =>
          (b.ticket || '').localeCompare(a.ticket || '')
        );
        break;

      // case 'project-asc':
      //   data.sort((a, b) =>
      //     (a.project || '').toString().localeCompare((b.project || '').toString())
      //   );
      //   break;

      // case 'project-desc':
      //   data.sort((a, b) =>
      //     (b.project || '').toString().localeCompare((a.project || '').toString())
      //   );
      //   break;
      case 'project-asc':
  data.sort((a, b) =>
    (a.project?.name || '').localeCompare(b.project?.name || '')
  );
  break;

case 'project-desc':
  data.sort((a, b) =>
    (b.project?.name || '').localeCompare(a.project?.name || '')
  );
  break;
    }

    this.dataSource.data = data;
  }

  
  // VIEW
  
  viewTask(t: any) {
    this.selectedTask = t;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  // EDIT
  editTask(t: any) {
    const role = localStorage.getItem('role');

    if (role !== 'admin') {
      Swal.fire('Access Denied', 'Not allowed', 'error');
      return;
    }

    this.router.navigate(['/add-task'], {
      queryParams: { id: t._id }
    });
  }

  // DELETE
  deleteTask(id: string) {
      const role = (localStorage.getItem('role') || '').toLowerCase();

   
    Swal.fire({
      title: 'Are you sure?',
      text: 'This task will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      confirmButtonText: 'Yes, delete it'
    }).then(result => {

      if (result.isConfirmed) {

        this.http.delete(`http://localhost:5000/api/tasks/delete/${id}?role=${role}`)
          .subscribe({
            next: () => {
              this.loadTasks();
              Swal.fire('Deleted!', 'Task removed successfully', 'success');
            },
            error: () => {
              Swal.fire('Error', 'Delete failed', 'error');
            }
          });

      }

    });
  }

  // REFRESH
  refresh() {
    this.loadTasks();
  }
}