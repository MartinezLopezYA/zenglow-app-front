import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PALETTE_OPTIONS, ThemeMode, ThemePalette, ThemeService } from '../../../core/services/theme.service';
import { FRONT_URL } from '../../../../../env';
import { CommerceService } from '../../../core/services/modules/commerce.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownOption, UIDropdownComponent } from '../../../components/shared/ui/ui-dropdown-component/ui-dropdown-component';
import { UIInputComponent } from '../../../components/shared/ui/ui-input-component/ui-input-component';
import { CommerceConfigService } from '../../../core/services/modules/commerce-config.service';
import { ChangeStatusResponse, CommerceConfigInterface, PaletteEnum, ThemeEnum } from '../../../core/interfaces/commerce-config.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, ReactiveFormsModule, UIInputComponent, UIDropdownComponent],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {

  readonly themeService = inject(ThemeService);
  readonly paletteOptions = PALETTE_OPTIONS;
  urlFront = FRONT_URL;
  slug = signal('');
  commerceConfig = signal<CommerceConfigInterface | null>(null);
  urlcopied = signal(false);
  showQrModal = signal(false);
  activePasarela = signal(false);
  showForm = signal(false);

  private commerceConfigService = inject(CommerceConfigService);
  private readonly commerceService = inject(CommerceService);

  ngOnInit(): void {
    this.slug.set(this.commerceService.me()?.commerce.commerceslug ?? '');
    this.commerceConfigService.getByCommerce(this.commerceService.me()?.commerce.commerceuuid ?? '').subscribe({
      next: (res) => {
        this.commerceConfig.set(res);
        this.activePasarela.set(res.commercewompi);
        this.themeService.setMode(res.commercetheme === 'DARK' ? 'dark' : 'light');
        this.themeService.setPalette(this.toThemePalette(res.commercepalette));
      }
    });
  }

  toggleTheme(): void {
    const previousMode = this.themeService.mode();
    this.themeService.toggleMode();
    this.persistTheme(previousMode, this.themeService.palette());
  }

  selectPalette(palette: ThemePalette): void {
    const previousPalette = this.themeService.palette();
    this.themeService.setPalette(palette);
    this.persistTheme(this.themeService.mode(), previousPalette);
  }

  copyToClipboard(): void {
    const url = this.getLandingUrl();
    navigator.clipboard.writeText(url).then(() => {
      this.urlcopied.set(true);
      setTimeout(() => {
        this.urlcopied.set(false);
      }, 3000);
    }).catch(() => {
      this.urlcopied.set(false);
    });
  }

  openQrModal(): void {
    this.showQrModal.set(true);
  }

  closeQrModal(): void {
    this.showQrModal.set(false);
  }

  private getLandingUrl(): string {
    return this.commerceConfig()?.commercelandingurl ?? `${this.urlFront}/landing-page/${this.slug()}`;
  }



  // Wompi Configuration

  envoptions: DropdownOption[] = [
    {abv: 'SANDBOX', name: 'Pruebas' },
    {abv: 'PRODUCTION', name: 'Producción' },
  ];

  activePasarelaToggle(): void {
    this.toggleConfig('commercewompi', (value) => this.commerceConfigService.allowWompi(this.commerceUuid(), this.configUuid(), value));
    this.showForm.set(true);
  }

  toggleScheduleByPage(): void {
    this.toggleConfig('commerceappointmentschedulepage', (value) => this.commerceConfigService.scheduleByPage(this.commerceUuid(), this.configUuid(), value));
  }

  toggleScheduleApproved(): void {
    this.toggleConfig('commerceappointmentapproveschedule', (value) => this.commerceConfigService.scheduleApproved(this.commerceUuid(), this.configUuid(), value));
  }

  toggleTips(): void {
    this.toggleConfig('commercetips', (value) => this.commerceConfigService.allowTips(this.commerceUuid(), this.configUuid(), value));
  }

  toggleDeliveryFee(): void {
    this.toggleConfig('commercedeliveryfee', (value) => this.commerceConfigService.allowDeliveryFee(this.commerceUuid(), this.configUuid(), value));
  }

  showFormToggle(): void {
    this.showForm.set(!this.showForm());
  }

  form: FormGroup = new FormGroup({
    publickey: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    privatekey: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    webhooksecret: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    environment: new FormControl<'SANDBOX' | 'PRODUCTION'>('SANDBOX', { validators: [Validators.required], nonNullable: true }),
  });

  onSubmit(): void {}

  private commerceUuid(): string {
    return this.commerceService.me()?.commerce.commerceuuid ?? '';
  }

  private configUuid(): string {
    return this.commerceConfig()?.commerceconfiguuid ?? '';
  }

  private persistTheme(previousMode: ThemeMode, previousPalette: ThemePalette): void {
    const currentConfig = this.commerceConfig();
    if (!currentConfig) return;

    this.commerceConfigService.updateTheme(this.commerceUuid(), this.configUuid(), {
      commercetheme: this.themeService.mode() === 'dark' ? ThemeEnum.DARK : ThemeEnum.LIGHT,
      commercepalette: this.toBackendPalette(this.themeService.palette()),
    }).subscribe({
      error: () => {
        this.themeService.setMode(previousMode);
        this.themeService.setPalette(previousPalette);
      },
    });
  }

  private toThemePalette(palette: CommerceConfigInterface['commercepalette']): ThemePalette {
    return palette === 'AMBAR' ? 'amber' : palette.toLowerCase() as ThemePalette;
  }

  private toBackendPalette(palette: ThemePalette): PaletteEnum {
    const paletteMap: Record<ThemePalette, PaletteEnum> = {
      blue: PaletteEnum.BLUE,
      purple: PaletteEnum.PURPLE,
      green: PaletteEnum.GREEN,
      amber: PaletteEnum.AMBAR,
    };

    return paletteMap[palette];
  }

  private toggleConfig(
    property: 'commerceappointmentschedulepage' | 'commerceappointmentapproveschedule' | 'commercetips' | 'commercedeliveryfee' | 'commercewompi',
    request: (value: boolean) => Observable<ChangeStatusResponse>,
  ): void {
    const currentConfig = this.commerceConfig();
    if (!currentConfig) return;

    const previousValue = currentConfig[property];
    const nextValue = !previousValue;
    this.commerceConfig.update((config) => config ? { ...config, [property]: nextValue } : config);
    this.activePasarela.set(property === 'commercewompi' ? nextValue : this.activePasarela());

    request(nextValue).subscribe({
      error: () => {
        this.commerceConfig.update((config) => config ? { ...config, [property]: previousValue } : config);
        if (property === 'commercewompi') this.activePasarela.set(previousValue);
      },
    });
  }
}
