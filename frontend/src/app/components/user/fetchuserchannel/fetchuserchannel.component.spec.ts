import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchuserchannelComponent } from './fetchuserchannel.component';

describe('FetchuserchannelComponent', () => {
  let component: FetchuserchannelComponent;
  let fixture: ComponentFixture<FetchuserchannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FetchuserchannelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FetchuserchannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
