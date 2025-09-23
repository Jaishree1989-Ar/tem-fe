import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagingUsageComponent } from './messaging-usage.component';

describe('MessagingUsageComponent', () => {
  let component: MessagingUsageComponent;
  let fixture: ComponentFixture<MessagingUsageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagingUsageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessagingUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
