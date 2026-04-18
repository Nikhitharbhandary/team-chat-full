import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmindmComponent } from './admindm.component';

describe('AdmindmComponent', () => {
  let component: AdmindmComponent;
  let fixture: ComponentFixture<AdmindmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmindmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdmindmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
