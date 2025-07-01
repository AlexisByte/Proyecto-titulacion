// auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: mockRouter },
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return false if no token is present', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_timestamp');
    const routeMock = { routeConfig: { path: 'Administrador' } } as any;

    const result = guard.canActivate(routeMock);
    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should allow access to "roles" route without checking roles', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('token_timestamp', Date.now().toString());
    const routeMock = { routeConfig: { path: 'roles' } } as any;

    const result = guard.canActivate(routeMock);
    expect(result).toBeTrue();
  });

  it('should deny access if user role does not match route', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('token_timestamp', Date.now().toString());
    localStorage.setItem('roles', JSON.stringify([{ nombre_rol: 'Ventanilla' }]));
    const routeMock = { routeConfig: { path: 'Administrador' } } as any;

    const result = guard.canActivate(routeMock);
    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['']);
  });

  it('should allow access if user role matches route', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('token_timestamp', Date.now().toString());
    localStorage.setItem('roles', JSON.stringify([{ nombre_rol: 'Administrador' }]));
    const routeMock = { routeConfig: { path: 'Administrador' } } as any;

    const result = guard.canActivate(routeMock);
    expect(result).toBeTrue();
  });
});
