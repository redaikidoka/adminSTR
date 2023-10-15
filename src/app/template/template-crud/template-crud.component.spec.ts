import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateCrudComponent } from './template-crud.component';

describe('TemplateCrudComponent', () => {
  let component: TemplateCrudComponent;
  let fixture: ComponentFixture<TemplateCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateCrudComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
