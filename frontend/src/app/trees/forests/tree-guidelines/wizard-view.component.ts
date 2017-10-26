import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TreesService } from '../../_services/trees.service';

@Component({
  selector: 'app-wizard-view',
  templateUrl: './wizard-view.component.html'
})
export class WizardViewComponent implements OnInit {
  @Input() forest: any;
  sectionInfo: any;
  currentStep: any;
  currentSubsection: any;
  numberOfSteps: number;

  constructor(private service: TreesService, private route: ActivatedRoute) {}

  previousStep() {
    if (this.currentStep.subsections) {
      if (!this.currentSubsection) {
        this.currentSubsection = this.findSubsectionStep(this.currentStep, this.currentStep.subsections.length - 1);
      } else {
        this.currentSubsection = this.findSubsectionStep(this.currentStep, this.currentSubsection.step - 1);
        if (!this.currentSubsection) {
          this.currentStep = this.findSectionByStepNumber(this.currentStep.step - 1);
          if (this.currentStep.subsections) {
            this.currentSubsection = this.findSubsectionStep(this.currentStep, this.currentStep.subsections.length - 1);
          }
        }
      }
    } else {
      this.currentStep = this.findSectionByStepNumber(this.currentStep.step - 1);
      if (this.currentStep.subsections) {
        this.currentSubsection = this.findSubsectionStep(this.currentStep, this.currentStep.subsections.length - 1);
      } else {
        this.currentSubsection = null;
      }
    }
    localStorage.setItem('wizard-step', `${this.currentStep.step}`);
  }

  nextStep() {
    if (this.currentStep.subsections) {
      if (!this.currentSubsection) {
        this.currentSubsection = this.findSubsectionStep(this.currentStep, 0);
      } else {
        this.currentSubsection = this.findSubsectionStep(this.currentStep, this.currentSubsection.step + 1);
        if (!this.currentSubsection) {
          this.currentStep = this.findSectionByStepNumber(this.currentStep.step + 1);
          if (this.currentStep.subsections) {
            this.currentSubsection = this.findSubsectionStep(this.currentStep, 0);
          }
        }
      }
    } else {
      this.currentStep = this.findSectionByStepNumber(this.currentStep.step + 1);
      if (this.currentStep.subsections) {
        this.currentSubsection = this.findSubsectionStep(this.currentStep, 0);
      } else {
        this.currentSubsection = null;
      }
    }
    localStorage.setItem('wizard-step', `${this.currentStep.step}`);
  }

  jumpToStep(item) {
    this.currentStep = this.findSectionByStepNumber(item.step);
    if (item.subsections) {
      this.currentSubsection = this.findSubsectionStep(item, 0);
    } else {
      this.currentSubsection = null;
    }
    localStorage.setItem('wizard-step', `${this.currentStep.step}`);
  }

  findSectionByStepNumber(step) {
    for (const section of this.sectionInfo) {
      if (section.step === step) {
        return section;
      }
    }
  }

  findSubsectionStep(currentStep, subsectionStep) {
    for (const section of currentStep.subsections) {
      if (section.step === subsectionStep) {
        return section;
      }
    }
    return null;
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      if (params['step']) {
        const section = this.findSectionByStepNumber(params['step']);
        this.jumpToStep(section);
      }
    });
    this.sectionInfo = this.service.getSectionInfo();
    this.currentStep = this.findSectionByStepNumber(0);
    this.numberOfSteps = this.sectionInfo.length;
  }
}
