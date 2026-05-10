import { downloadBlob } from './file-download.utils';

describe('FileDownloadUtils', () => {
  it('should create an anchor and trigger download', () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    const spyCreate = spyOn(document, 'createElement').and.callThrough();
    const spyAppend = spyOn(document.body, 'appendChild').and.callThrough();
    const spyRemove = spyOn(document.body, 'removeChild').and.callThrough();
    
    // We can't easily spy on anchor.click() if we don't mock the anchor, but we can mock createElement
    const mockAnchor = document.createElement('a');
    spyOn(mockAnchor, 'click');
    spyCreate.and.returnValue(mockAnchor);

    downloadBlob(blob, 'test.txt');

    expect(spyCreate).toHaveBeenCalledWith('a');
    expect(mockAnchor.download).toBe('test.txt');
    expect(spyAppend).toHaveBeenCalledWith(mockAnchor);
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(spyRemove).toHaveBeenCalledWith(mockAnchor);
  });
});
