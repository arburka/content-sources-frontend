import {
  Button,
  Checkbox,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Switch,
} from '@patternfly/react-core';
import { cloneElement, ReactElement, useState } from 'react';

type SecurityLevel = 'validated' | 'remediated';

export interface NotificationPreferences {
  enabled: boolean;
  securityLevels: SecurityLevel[];
}

type NotificationConfigModalProps = {
  preferences: NotificationPreferences;
  onSave: (preferences: NotificationPreferences) => void;
  children: ReactElement<{ onClick?: (event: React.MouseEvent) => void }>;
};

const NotificationConfigModal = ({
  preferences: savedPreferences,
  onSave,
  children,
}: NotificationConfigModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<NotificationPreferences>(savedPreferences);
  const [isSaved, setIsSaved] = useState(false);

  const openModal = () => {
    setDraft(savedPreferences);
    setIsSaved(false);
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  const trigger = cloneElement(children, {
    onClick: (event: React.MouseEvent) => {
      children.props.onClick?.(event);
      if (!event.defaultPrevented) {
        openModal();
      }
    },
  });

  const toggleSecurityLevel = (level: SecurityLevel, checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      securityLevels: checked
        ? [...prev.securityLevels, level]
        : prev.securityLevels.filter((l) => l !== level),
    }));
  };

  const isFormValid = !draft.enabled || draft.securityLevels.length > 0;

  const handleSave = () => {
    onSave(draft);
    setIsSaved(true);
  };

  return (
    <>
      {trigger}
      <Modal
        variant={ModalVariant.medium}
        position='top'
        isOpen={isOpen}
        onClose={closeModal}
        aria-labelledby='lightwell-notification-config-modal-title'
        ouiaId='lightwell-notification-config-modal'
      >
        <ModalHeader
          title='Notification preferences'
          labelId='lightwell-notification-config-modal-title'
          description='Configure how you get notified when new packages are available. Toggle notifications for individual repositories in the table below.'
        />
        <ModalBody>
          <Form>
            <FormGroup fieldId='notification-toggle' label='Email notifications'>
              <Switch
                id='notification-toggle'
                label={
                  draft.enabled
                    ? 'Send me an email immediately when a new package is available'
                    : 'Notifications are disabled'
                }
                isChecked={draft.enabled}
                onChange={(_event, checked) => setDraft((prev) => ({ ...prev, enabled: checked }))}
                ouiaId='notification-toggle'
              />
            </FormGroup>

            {draft.enabled && (
              <FormGroup
                fieldId='security-levels'
                label='Security levels'
                isRequired
                role='group'
              >
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>
                      Only notify me for packages at these security levels.
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
                <Checkbox
                  id='security-level-validated'
                  label='Validated — rebuilt from source and verified end-to-end'
                  isChecked={draft.securityLevels.includes('validated')}
                  onChange={(_event, checked) => toggleSecurityLevel('validated', checked)}
                />
                <Checkbox
                  id='security-level-remediated'
                  label='Remediated — includes Red Hat backported security fixes'
                  isChecked={draft.securityLevels.includes('remediated')}
                  onChange={(_event, checked) => toggleSecurityLevel('remediated', checked)}
                />
              </FormGroup>
            )}

            {isSaved && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant='success'>
                    Notification preferences saved.
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            key='save'
            variant='primary'
            isDisabled={!isFormValid}
            onClick={handleSave}
            ouiaId='notification-save-button'
          >
            Save
          </Button>
          <Button key='cancel' variant='link' onClick={closeModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default NotificationConfigModal;
