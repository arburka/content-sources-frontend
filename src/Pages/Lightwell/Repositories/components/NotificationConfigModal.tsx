import {
  Button,
  Form,
  FormGroup,
  FormHelperText,
  FormSelect,
  FormSelectOption,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Radio,
  Switch,
} from '@patternfly/react-core';
import { cloneElement, ReactElement, useState } from 'react';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type Audience = 'all' | 'admins' | 'me';

export interface NotificationPreferences {
  enabled: boolean;
  severityThreshold: Severity;
  audience: Audience;
}

type NotificationConfigModalProps = {
  preferences: NotificationPreferences;
  onSave: (preferences: NotificationPreferences) => void;
  children: ReactElement<{ onClick?: (event: React.MouseEvent) => void }>;
};

const severityOptions: { value: Severity; label: string }[] = [
  { value: 'critical', label: 'Critical only' },
  { value: 'high', label: 'High and above' },
  { value: 'medium', label: 'Medium and above' },
  { value: 'low', label: 'All severities' },
];

const audienceOptions: { value: Audience; label: string }[] = [
  { value: 'all', label: 'All organization members' },
  { value: 'admins', label: 'Organization admins only' },
  { value: 'me', label: 'Only me' },
];

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

  const handleSave = () => {
    onSave(draft);
    closeModal();
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
          description='Get notified when vulnerability fixes are available for packages in your repositories.'
        />
        <ModalBody>
          <Form>
            <FormGroup fieldId='notification-toggle' label='Email notifications'>
              <Switch
                id='notification-toggle'
                label={
                  draft.enabled
                    ? 'Notify me when fixes are available'
                    : 'Notifications are off'
                }
                isChecked={draft.enabled}
                onChange={(_event, checked) => setDraft((prev) => ({ ...prev, enabled: checked }))}
                ouiaId='notification-toggle'
              />
            </FormGroup>

            {draft.enabled && (
              <>
                <FormGroup fieldId='notification-audience' label='Send notifications to'>
                  <FormSelect
                    id='notification-audience'
                    value={draft.audience}
                    onChange={(_event, value) =>
                      setDraft((prev) => ({ ...prev, audience: value as Audience }))
                    }
                    ouiaId='notification-audience-select'
                  >
                    {audienceOptions.map(({ value, label }) => (
                      <FormSelectOption key={value} value={value} label={label} />
                    ))}
                  </FormSelect>
                </FormGroup>

                <FormGroup
                  fieldId='severity-threshold'
                  label='Severity threshold'
                  isRequired
                  role='radiogroup'
                >
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem>
                        Get notified immediately when fixes are available for vulnerabilities at or above this severity.
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                  {severityOptions.map(({ value, label }) => (
                    <Radio
                      key={value}
                      id={`severity-${value}`}
                      name='severity-threshold'
                      label={label}
                      isChecked={draft.severityThreshold === value}
                      onChange={() => setDraft((prev) => ({ ...prev, severityThreshold: value }))}
                    />
                  ))}
                </FormGroup>
              </>
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
