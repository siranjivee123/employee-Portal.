import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeeList } from './employee-list';

describe('EmployeeeList', () => {
  let component: EmployeeeList;
  let fixture: ComponentFixture<EmployeeeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeeList],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeeList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
