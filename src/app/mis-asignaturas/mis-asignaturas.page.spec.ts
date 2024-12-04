import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisAsignaturasPage } from './mis-asignaturas.page';

describe('MisAsignaturasPage', () => {
  let component: MisAsignaturasPage;
  let fixture: ComponentFixture<MisAsignaturasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisAsignaturasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
