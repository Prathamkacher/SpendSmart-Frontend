import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserProfile, UpdateProfileRequest } from '../../core/models/auth.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  profileForm!: FormGroup;
  user = this.authService.currentUser;
  isUpdating = false;
  previewUrl: string | null = null;

  ngOnInit(): void {
    const currentUser = this.user();
    this.previewUrl = currentUser?.avatarUrl || null;
    
    this.profileForm = this.fb.group({
      fullName: [currentUser?.fullName || '', [Validators.required, Validators.minLength(2)]],
      email: [{ value: currentUser?.email || '', disabled: true }],
      currency: [currentUser?.currency || 'INR', [Validators.required]],
      bio: [currentUser?.bio || ''],
      avatarUrl: [currentUser?.avatarUrl || ''],
      monthlyBudget: [currentUser?.monthlyBudget || 0, [Validators.min(0)]]
    });
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
        this.profileForm.patchValue({ avatarUrl: this.previewUrl });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.isUpdating = true;
    const request: UpdateProfileRequest = this.profileForm.getRawValue();

    this.authService.updateProfile(request).subscribe({
      next: (res) => {
        this.isUpdating = false;
        // The signal is updated automatically by AuthService
      },
      error: () => {
        this.isUpdating = false;
      }
    });
  }
}
