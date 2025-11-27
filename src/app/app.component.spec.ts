import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { AppComponent } from './app.component';

/** Dummies standalone para as rotas usadas nos testes */
@Component({ standalone: true, template: '<p>Home</p>' })
class HomeDummy {}

@Component({ standalone: true, template: '<p>Secretaria Dashboard</p>' })
class SecretariaDashboardDummy {}

describe('AppComponent', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HomeDummy, SecretariaDashboardDummy],
      providers: [
        provideRouter([
          { path: '', component: HomeDummy },
          { path: 'home', component: HomeDummy },
          { path: 'secretaria/dashboard', component: SecretariaDashboardDummy },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('should create the root component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the router outlet for child routes', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  it('should show the footer on the landing routes', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    // navega para '' e 'home' dentro da NgZone
    await fixture.ngZone!.run(() => router.navigateByUrl('/'));
    fixture.detectChanges();
    expect(app.showFooter).toBeTrue();

    await fixture.ngZone!.run(() => router.navigateByUrl('/home'));
    fixture.detectChanges();
    expect(app.showFooter).toBeTrue();
  });

  it('should hide the footer on feature modules', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    await fixture.ngZone!.run(() =>
      router.navigateByUrl('/secretaria/dashboard')
    );
    fixture.detectChanges();
    expect(app.showFooter).toBeFalse();
  });
});
