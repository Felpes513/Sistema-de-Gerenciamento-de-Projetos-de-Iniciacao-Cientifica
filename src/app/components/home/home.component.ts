import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent implements AfterViewInit {
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('swiperRef') swiperRef?: ElementRef;

  // ✅ Só aparece em notebook/desktop
  exibirCarousel = true;

  slides = [
    {
      title: 'Pesquisa e Inovação',
      content:
        'Desenvolva projetos inovadores que contribuem para o avanço da ciência e tecnologia.',
      icon: 'fas fa-flask',
      img: '../../../assets/Barcelona.png',
    },
    {
      title: 'Orientação Especializada',
      content:
        'Conte com professores experientes para guiar sua jornada acadêmica e científica.',
      icon: 'fas fa-user-friends',
      img: '../../../assets/centro.jpg',
    },
    {
      title: 'Bolsas de Estudo',
      content:
        'Oportunidades de bolsas para dedicação exclusiva aos seus projetos de pesquisa.',
      icon: 'fas fa-graduation-cap',
      img: '../../../assets/conceicao.png',
    },
    {
      title: 'Publicações Científicas',
      content:
        'Publique seus resultados em revistas e eventos científicos de renome nacional e internacional.',
      icon: 'fas fa-book-open',
      img: '../../../assets/Barcelona.png',
    },
  ];

  constructor() {
    const sub = this.breakpoint
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .subscribe((state) => {
        const shouldShow = !state.matches;
        const wasShowing = this.exibirCarousel;

        this.exibirCarousel = shouldShow;

        // ✅ se saiu do mobile/tablet e voltou pro desktop, reinicializa
        if (shouldShow && !wasShowing) {
          setTimeout(() => this.initSwiper(), 0);
        }
      });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  ngAfterViewInit(): void {
    if (this.exibirCarousel) {
      this.initSwiper();
    }
  }

  private initSwiper(): void {
    const el = this.swiperRef?.nativeElement as any;
    if (!el || typeof el.initialize !== 'function') return;

    Object.assign(el, {
      slidesPerView: 1,
      loop: true,
      speed: 800,
      effect: 'fade',
      autoplay: { delay: 5000, disableOnInteraction: false },
    });

    el.initialize();
  }
}
