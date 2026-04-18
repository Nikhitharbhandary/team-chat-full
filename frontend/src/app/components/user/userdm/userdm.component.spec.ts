import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserdmComponent } from './userdm.component';

describe('UserdmComponent', () => {
  let component: UserdmComponent;
  let fixture: ComponentFixture<UserdmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserdmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserdmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
