import {
  Component,
  ViewChild,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ConceptList } from '@app/core/models/concept-model/concept-list.model';
import { ConceptConfigurationService } from '@app/core/service/concept-configuration-service/concept-configuration.service';
import { GradingService } from '@app/core/service/grading-service/grading.service';

@Component({
  selector: 'app-concept-list-details-modal',
  templateUrl: './concept-list-details-modal.component.html',
})
export class ConceptListDetailsModalComponent implements OnInit {
  detailsConceptForm: FormGroup;
  submitted = false;
  detailsData = [];
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  conceptListModel: ConceptList = new ConceptList();
  conceptLevels: ConceptList = new ConceptList();
  calificationList!: [];

  constructor(
    private modalService: NgbModal,
    private conceptConfigurationService: ConceptConfigurationService,
    private gradingService: GradingService
  ) {}

  ngOnInit(): void {
    this.fetchCalificationList();
  }
  @ViewChild('table') table: DatatableComponent;
  @ViewChild('conceptDetailsModal') conceptDetailsModal: NgbModal;
  @Output('loadConceptList') loadConceptList: EventEmitter<any> =
    new EventEmitter();

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    if (this.table) {
      this.table.recalculate();
      this.table.recalculateColumns();
    }
  }

  detailsOpenModal(content, row: ConceptList) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });

    this.conceptListModel = row;
    this.conceptLevels = row;
    this.conceptConfigurationService
      .getConceptConfigurationByConceptId(this.conceptLevels.id)
      .subscribe((resp) => {
        if (resp !== null) {
          this.temp = [...resp];
          this.rows = resp;
          this.loadingIndicator = false;
        }
      });
  }

  fetchCalificationList() {
    this.gradingService.getAll().subscribe((resp) => {
      if (resp !== null) {
        this.calificationList = resp;
      }
    });
  }

  getRowHeight(row) {
    return row.height;
  }
}
