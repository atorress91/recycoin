import { Component, OnInit } from '@angular/core';
import { Product } from '@app/core/models/product-model/product.model';
import { ProductService } from '@app/core/service/product-service/product.service';

@Component({
  selector: 'app-products-preview',
  templateUrl: './products-preview.component.html',
  styleUrls: ['./products-preview.component.scss']
})
export class ProductsPreviewComponent implements OnInit {
  public productList: any;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadAllRecyCoin();
  }

  loadAllRecyCoin() {
    this.productService.getAllRecyCoin().subscribe((coin: Product) => {
      this.productList = coin;
      this.productList.forEach((item: any) => {
        Object.assign(item, { quantity: 1, total: item.salePrice });
      });
    })
  }
}
