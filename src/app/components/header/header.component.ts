import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() pageChange: EventEmitter<string> = new EventEmitter<string>();
  currentPage: string = 'inventory';

  ngOnInit(): void {
  }

  constructor(
  ) {
  }

  setPage(page: string) {
    this.currentPage = page;
    this.pageChange.emit(page);
  }
}
