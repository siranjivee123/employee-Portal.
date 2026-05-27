import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSuccessDialog } from './employee-success-dialog.component';

describe('EmployeeSuccessDialog', () => {
  let component: EmployeeSuccessDialog;
  let fixture: ComponentFixture<EmployeeSuccessDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeSuccessDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeSuccessDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
