import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UfpComponent } from './ufp.component';

describe('UfpComponent', () => {
  let component: UfpComponent;
  let fixture: ComponentFixture<UfpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UfpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UfpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
