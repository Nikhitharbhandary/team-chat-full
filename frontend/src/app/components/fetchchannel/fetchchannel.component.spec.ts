import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchchannelComponent } from './fetchchannel.component';

describe('FetchchannelComponent', () => {
  let component: FetchchannelComponent;
  let fixture: ComponentFixture<FetchchannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FetchchannelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FetchchannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
