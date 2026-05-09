import { downloadBlob } from './file-download.utils';

describe('file-download.utils', () => {
  it('creates, clicks, and cleans up a temporary anchor for downloads', () => {
    const blob = new Blob(['report']);
    const anchor = document.createElement('a');
    const clickSpy = spyOn(anchor, 'click');
    const createObjectUrlSpy = spyOn(window.URL, 'createObjectURL').and.returnValue('blob:test');
    const revokeObjectUrlSpy = spyOn(window.URL, 'revokeObjectURL');
    const createElementSpy = spyOn(document, 'createElement').and.returnValue(anchor);
    const appendSpy = spyOn(document.body, 'appendChild').and.callThrough();
    const removeSpy = spyOn(document.body, 'removeChild').and.callThrough();

    downloadBlob(blob, 'report.csv');

    expect(createObjectUrlSpy).toHaveBeenCalledWith(blob);
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(anchor.href).toBe('blob:test');
    expect(anchor.download).toBe('report.csv');
    expect(appendSpy).toHaveBeenCalledWith(anchor);
    expect(clickSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith(anchor);
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:test');
  });
});
