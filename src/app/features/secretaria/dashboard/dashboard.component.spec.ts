import { TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
    }).compileComponents();
  });

  it('should expose chart data', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;
    expect(component.barChartData.datasets.length).toBe(3);
    expect(component.barChartOptions.plugins?.title?.text).toContain('Status');
  });

  it('should keep labels aligned with datasets', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;
    const labels = component.barChartData.labels ?? [];
    component.barChartData.datasets.forEach((dataset) => {
      expect(dataset.data.length).toBe(labels.length);
    });
  });
});
