import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {PdfDocument} from "@app/core/interfaces/pdf-document.interface";
import {PdfViewerService} from "@app/core/service/pdf-viewer-service/pdf-viewer.service";

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent implements OnInit, OnDestroy {
  isVisible: boolean = false;
  currentDocument: PdfDocument | null = null;
  zoom: number = 1;
  currentPage: number = 1;
  totalPages: number = 0;

  private subscriptions: Subscription[] = [];
  protected pdfSrc: string;
  protected title: any;

  constructor(private pdfViewerService: PdfViewerService) {
  }

  ngOnInit() {
    this.subscriptions.push(
      this.pdfViewerService.isVisible$.subscribe(
        isVisible => this.isVisible = isVisible
      ),
      this.pdfViewerService.currentDocument$.subscribe(
        document => {
          this.currentDocument = document;
          if (document) {
            this.resetViewer();
          }
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  resetViewer() {
    this.zoom = 1;
    this.currentPage = 1;
    this.totalPages = 0;
  }

  close() {
    this.pdfViewerService.hidePdf();
  }

  closeModal(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  zoomIn() {
    this.zoom = Math.min(this.zoom + 0.1, 2);
  }

  zoomOut() {
    this.zoom = Math.max(this.zoom - 0.1, 0.5);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  afterLoadComplete(pdf: any) {
    this.totalPages = pdf.numPages;
  }

  downloadPdf() {
    const link = document.createElement('a');
    link.href = this.pdfSrc;
    link.download = this.title.replace(/\s+/g, '_').toLowerCase() + '.pdf';
    link.click();
  }
}
