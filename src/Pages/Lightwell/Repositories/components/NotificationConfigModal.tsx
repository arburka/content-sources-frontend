import {
  Button,
  Content,
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
  Tab,
  TabContent,
  TabContentBody,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import { cloneElement, ReactElement, useState } from 'react';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type Audience = 'all' | 'admins' | 'me';

export interface NotificationPreferences {
  enabled: boolean;
  severityThreshold: Severity;
  audience: Audience;
  notifyNewPackages: boolean;
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
  const [activeTab, setActiveTab] = useState<string | number>('email');

  const openModal = () => {
    setDraft(savedPreferences);
    setActiveTab('email');
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
          <Tabs
            activeKey={activeTab}
            onSelect={(_event, tabIndex) => setActiveTab(tabIndex)}
            aria-label='Notification channel tabs'
          >
            <Tab eventKey='email' title={<TabTitleText>Email</TabTitleText>}>
              <TabContent id='email-tab'>
                <TabContentBody hasPadding>
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
                        onChange={(_event, checked) =>
                          setDraft((prev) => ({ ...prev, enabled: checked }))
                        }
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

                        <FormGroup fieldId='notify-new-packages' label='New packages'>
                          <Switch
                            id='notify-new-packages'
                            label='Notify me when new packages are added to selected repositories'
                            isChecked={draft.notifyNewPackages}
                            onChange={(_event, checked) =>
                              setDraft((prev) => ({ ...prev, notifyNewPackages: checked }))
                            }
                            ouiaId='notify-new-packages-toggle'
                          />
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
                                Get notified immediately when fixes are available for
                                vulnerabilities at or above this severity.
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
                              onChange={() =>
                                setDraft((prev) => ({ ...prev, severityThreshold: value }))
                              }
                            />
                          ))}
                        </FormGroup>
                      </>
                    )}
                  </Form>
                </TabContentBody>
              </TabContent>
            </Tab>
            <Tab eventKey='slack' title={<TabTitleText>Slack</TabTitleText>}>
              <TabContent id='slack-tab'>
                <TabContentBody hasPadding>
                  <Content component='p'>
                    Connect a Slack workspace to receive notifications in your team's channels. Coming soon.
                  </Content>
                </TabContentBody>
              </TabContent>
            </Tab>
            <Tab eventKey='digest' title={<TabTitleText>Weekly digest</TabTitleText>}>
              <TabContent id='digest-tab'>
                <TabContentBody hasPadding>
                  <Content component='p'>
                    Receive a weekly summary of all activity across your Lightwell repositories. Coming soon.
                  </Content>
                </TabContentBody>
              </TabContent>
            </Tab>
          </Tabs>
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
