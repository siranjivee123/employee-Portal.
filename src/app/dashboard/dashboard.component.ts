import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../services/dashboard.service';
import { ThemeService } from '../services/theme.service';
import { EmployeeListComponent } from '../employee-list/employee-list';
import { ProjectsComponent } from '../projects/projects';
import { TaskListComponent } from '../tasks/task-list/task-list.component';
import { LeaveListComponent } from '../leave-management/leave-list/leave-list.component';
import { ViewChild, ElementRef,AfterViewInit} from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    EmployeeListComponent,
    ProjectsComponent,
    TaskListComponent,
    LeaveListComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  isSidebarOpen = false;
  isDarkMode = false;
  dashboardData: any;   
  activeView: string = 'dashboard';
  role: string = '';
  menuItems: any[] = [];
employeeProjectNames: string[] = [];
  //DASHBOARD VALUES
  totalEmployees = 0;
  inprogressProjects = 0;
  inprogressTasks = 0;
  pendingTasks = 0;
  completedTasks = 0;
  leaveRequests = 0;
  pendingProjects = 0;
  completedProjects = 0;
@ViewChild('taskChart') taskChartRef!: ElementRef;
@ViewChild('projectChart') projectChartRef!: ElementRef;
@ViewChild('leaveChart') leaveChartRef!: ElementRef;

  // CHART VARIABLES
  taskChart: any;
  projectChart: any;
  leaveChart: any;

  // MENU ITEMS
  allMenuItems = [
    { label: 'Dashboard',
       icon: 'dashboard',
        view: 'dashboard',
         roles: ['admin', 'manager', 'employee'] 
        },
    { label: 'Employees', 
      icon: 'people', 
      view: 'employees',
       roles: ['admin','manager'] 
      },
    { label: 'Projects', 
      icon: 'settings',
       view: 'projects', 
       roles: ['admin','manager']
       },
    { label: 'Tasks', 
      icon: 'assignment',
       view: 'tasks',
        roles: ['admin', 'manager', 'employee'] 
      },
    { label: 'Leave Management',
       icon: 'event',
        view: 'leave',
         roles: ['admin', 'manager', 'employee']
         }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private themeService: ThemeService
  ) {}
normalizeData(data: any) {
  return {
    completed: data?.completed ?? data?.Completed ?? 0,
    pending: data?.pending ?? data?.Pending ?? 0,
    inProgress:
      data?.inProgress ??
      data?.in_progress ??
      data?.InProgress ??
      data?.progress ??
      0
  };
}

  ngOnInit() {

    // ROLE
    this.role = (localStorage.getItem('role') || '').toLowerCase();

    // MENU Fiters:
     this.menuItems = this.allMenuItems.filter(item =>
      item.roles.includes(this.role)
    );


     // VIEW CONTROL
    this.route.queryParams.subscribe(params => {
      this.activeView = params['view'] || 'dashboard';
    
  
     if (this.activeView === 'dashboard') {
    this.loadDashboardData();
  }
});
  }

// THEME
   toggleTheme() {
     this.isDarkMode = !this.isDarkMode;

  if (this.isDarkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}
 

 ngAfterViewInit() {

  
     if (this.activeView === 'dashboard') {}
  
}

  // LOAD DATA FROM BACKEND
  loadDashboardData() {
  this.dashboardService.getDashboardData().subscribe({
    next: (res: any) => {
       this.dashboardData = res;

      console.log("API DATA ", res); 
 //  NORMALIZE DATA
      const tasks = this.normalizeData(res.tasks);
      const projects = this.normalizeData(res.projects);

      const leaves = {
        approved: res.leaves?.approved ?? 0,
        pending: res.leaves?.pending ?? 0,
        rejected: res.leaves?.rejected ?? 0
      };

  // CARDS
      this.pendingTasks = res.tasks?.pending || 0;
            this.completedTasks = res.tasks?.completed || 0;

      this.inprogressProjects = res.projects?.inProgress || 0;
            this.inprogressTasks = res.tasks?.inProgress || 0;

      this.completedProjects = res.projects?.completed || 0;
      this.leaveRequests = res.leaves?.pending || 0;
      this.pendingProjects = res.projects?.pending || 0;
      this.totalEmployees = res.totalEmployees || 0;

      //  
      setTimeout(() => {
         if (
    this.taskChartRef?.nativeElement &&
    this.projectChartRef?.nativeElement &&
    this.leaveChartRef?.nativeElement
         ) {
        this.createTaskChart(res.tasks || {});
        this.createProjectChart(res.projects || {});
        this.createLeaveChart(res.leaves || {});
        }
      });

    },
    error: (err) => {
      console.error('Dashboard error:', err);
    }
  });
}

  // CHARTS

  createTaskChart(tasks: any) {
  if (!this.taskChartRef?.nativeElement) return;

  if (this.taskChart) this.taskChart.destroy();

  const textColor = '#000000';

  this.taskChart = new Chart(this.taskChartRef.nativeElement, {
    type: 'pie',
    data: {
      labels: ['Completed', 'Pending', 'In Progress'],
      datasets: [{
        data: [
          tasks?.completed || 0,
          tasks?.pending || 0,
          tasks?.inProgress || 0
        ],
        backgroundColor: ['#4CAF50', '#FF9800', '#2196F3']
       
    },  ],
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      }
    }
        
    
    
  });
}

  createProjectChart(projects: any) {
    if (this.projectChart) this.projectChart.destroy();
const textColor =  '#000000';
    this.projectChart = new Chart( 
       this.projectChartRef.nativeElement,

      
      {
      type: 'pie',
      data: {
        labels: ['Completed', 'Pending', 'In Progress'],
        datasets: [{
          data: [
            projects?.completed || 0,
            projects?.pending || 0,
            projects?.inProgress || 0
          ],
          backgroundColor: ['#4CAF50', '#FF9800', '#2196F3']
       
    },  ],
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      }
    }
        
    
    
  });
}
  createLeaveChart(leaves: any) {
    if (this.leaveChart) this.leaveChart.destroy();
const textColor =  '#000000';
    this.leaveChart = new Chart(
       this.leaveChartRef.nativeElement, 

      
      {
      type: 'pie',
      data: {
        labels: ['Approved', 'Pending', 'Rejected'],
        datasets: [{
          data: [
            leaves?.approved || 0,
            leaves?.pending || 0,
            leaves?.rejected || 0
          ],
            backgroundColor: ['#4CAF50', '#FF9800', '#2196F3']
       
    },  ],
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      }
    }
        
    
    
  });
}
  // SIDEBAR

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  setView(view: string) {
    this.router.navigate(['/dashboard'], { queryParams: { view } });
    this.isSidebarOpen = false;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}