import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ConfigurationService } from '@app/core/service/configuration-service/configuration.service';
import { MatrixConfiguration } from '@app/core/models/matrix-configuration-model/matrix.configuration.model';

interface Alert {
  type: string;
  message: string;
}

const ALERTS: Alert[] = [
  {
    type: 'info',
    message: '',
  },
];
@Component({
  selector: 'app-arrays-configurations',
  templateUrl: './arrays-configurations.component.html',
  providers: [ToastrService],
})
export class ArraysConfigurationsComponent implements OnInit {
  alerts: Alert[];
  show: Boolean = true;
  linkMsj: String = 'hide';
  matrixConfigurationForm: FormGroup;
  submitted = false;
  matrixConfiguration: MatrixConfiguration = new MatrixConfiguration();

  constructor(
    private formBuilder: FormBuilder,
    private configurationService: ConfigurationService,
    private toastr: ToastrService
  ) {
    this.alerts = Array.from(ALERTS);
  }

  ngOnInit(): void {
    this.loadValidations();
    this.loadConfiguration();
  }
  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }

  showMsj() {
    if (this.show) {
      this.show = false;
      this.linkMsj = 'show';
    } else {
      this.show = true;
      this.linkMsj = 'hide';
    }
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  get create_matrix_controls(): { [key: string]: AbstractControl } {
    return this.matrixConfigurationForm.controls;
  }

  loadValidations() {
    this.matrixConfigurationForm = this.formBuilder.group({
      unilevel_matrix: [],
      forced_matrix: [],
      binary_matrix: [],
      front_affiliates: ['', Validators.required],
      software_millenium: ['', Validators.required],
    });
  }

  onAddRowSave() {
    this.submitted = true;
    if (this.matrixConfigurationForm.invalid) {
      return;
    }
    this.matrixConfiguration.uni_level_matrix =
      this.matrixConfigurationForm.value.unilevel_matrix ?? false;
    this.matrixConfiguration.force_matrix =
      this.matrixConfigurationForm.value.forced_matrix ?? false;
    this.matrixConfiguration.binary_matrix =
      this.matrixConfigurationForm.value.binary_matrix ?? false;
    this.matrixConfiguration.affiliates_front_num =
      this.matrixConfigurationForm.value.front_affiliates;
    this.matrixConfiguration.software_millennium_front_num =
      this.matrixConfigurationForm.value.software_millenium;

    this.configurationService
      .createMatrixConfiguration(this.matrixConfiguration)
      .subscribe((resp) => {
        this.showSuccess('The configuration was update successfully!');
        this.loadConfiguration();
      });
  }

  loadConfiguration() {
    this.configurationService
      .getMatrixConfiguration()
      .subscribe((resp: MatrixConfiguration) => {

        this.matrixConfigurationForm.setValue({
          unilevel_matrix: resp.uni_level_matrix,
          forced_matrix: resp.force_matrix,
          binary_matrix: resp.binary_matrix,
          front_affiliates: resp.affiliates_front_num,
          software_millenium: resp.software_millennium_front_num,
        });
      });
  }
}
