import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('adds and removes timed toasts', fakeAsync(() => {
    service.success('Saved', 1000);
    expect(service.toasts().length).toBe(1);

    tick(1000);
    expect(service.toasts().length).toBe(0);
  }));

  it('removes a toast manually', () => {
    service.error('Broken', 0);
    const toastId = service.toasts()[0].id;

    service.remove(toastId);
    expect(service.toasts().length).toBe(0);
  });
});
