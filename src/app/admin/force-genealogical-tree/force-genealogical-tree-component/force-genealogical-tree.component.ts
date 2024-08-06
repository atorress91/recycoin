import {
  Component,
  Input,
  ViewEncapsulation,
  TemplateRef,
} from '@angular/core';
import { TreeNode } from '@app/core/models/unilevel-tree-model/tree-node';

@Component({
  selector: 'app-force-genealogical-tree',
  exportAs: 'orgChart',
  templateUrl: './force-genealogical-tree.component.html',
  styleUrls: ['./force-genealogical-tree.component.scss'],
  host: {
    '[class.ng13-org-chart-zoom-out]': 'zoomOut',
  },
  encapsulation: ViewEncapsulation.None,
})
export class ForceGenealogicalTreeComponent {
  @Input('data') data: TreeNode | undefined;
  @Input() hasParent = false;
  @Input('nodeTemplate') nodeTemplate!: TemplateRef<any>;
  zoomOut = false;

  constructor() {}
  public onClick() {
    if (this.data && this.data.onClick) {
      this.data.onClick();
    }
  }
}
