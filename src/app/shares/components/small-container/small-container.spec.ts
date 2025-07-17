import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallContainer } from './small-container';

describe('SmallContainer', () => {
  let component: SmallContainer;
  let fixture: ComponentFixture<SmallContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmallContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmallContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
