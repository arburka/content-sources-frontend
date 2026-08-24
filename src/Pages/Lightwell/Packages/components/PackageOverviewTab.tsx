import {
  Button,
  ClipboardCopy,
  ClipboardCopyVariant,
  Content,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
  Tab,
  TabContent,
  Tabs,
  TabTitleText,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { createRef, useMemo, useState } from 'react';

import ConnectRepositoryModal from '../../Repositories/components/ConnectRepositoryModal';
import { ConnectSnippetTab } from '../../Repositories/components/connectSnippets';
import {
  getMavenPackageUsageSnippetTabs,
  getPythonPackageUsageSnippetTabs,
} from './packageDependencySnippets';

type PackageOverviewTabProps = {
  isMaven: boolean;
  group: string;
  name: string;
  latestRelease: string;
  hasRelease: boolean;
  summary?: string;
  sourceUrl?: string;
  repository?: {
    uuid: string;
    name: string;
    published_distribution_url: string;
    content_type: string;
  };
};

const PackageOverviewTab = ({
  isMaven,
  group,
  name,
  latestRelease,
  hasRelease,
  summary,
  sourceUrl = '',
  repository,
}: PackageOverviewTabProps) => {
  const tabs = useMemo(
    () =>
      isMaven
        ? getMavenPackageUsageSnippetTabs({
            group,
            name,
            release: latestRelease,
            sourceUrl,
          })
        : getPythonPackageUsageSnippetTabs({
            name,
            release: latestRelease,
            sourceUrl,
          }),
    [isMaven, group, name, latestRelease, sourceUrl],
  );
  const [activeTabKey, setActiveTabKey] = useState(tabs[0]?.eventKey ?? '');

  const tabRefs = useMemo(
    () =>
      tabs.reduce(
        (refs, tab) => {
          refs[tab.eventKey] = createRef<HTMLElement>();
          return refs;
        },
        {} as Record<string, React.RefObject<HTMLElement>>,
      ),
    [tabs],
  );

  const renderTabPanel = (tab: ConnectSnippetTab) => (
    <Stack hasGutter>
      {tab.snippets.map((snippet) => (
        <StackItem key={snippet.label}>
          <ClipboardCopy
            isReadOnly
            isCode
            hoverTip='Copy'
            clickTip='Copied'
            variant={ClipboardCopyVariant.expansion}
            isExpanded
          >
            {snippet.code}
          </ClipboardCopy>
        </StackItem>
      ))}
    </Stack>
  );

  return (
    <Flex direction={{ default: 'column' }} gap={{ default: 'gapLg' }}>
      <Stack hasGutter>
        <Title headingLevel='h2' size='lg'>
          About this package
        </Title>
        <Content>
          <p>{summary ?? 'Package description not yet available.'}</p>
          {hasRelease ? (
            <p>
              This package has been rebuilt by Red Hat with backported fixes for known
              vulnerabilities. The upstream version is pinned and Red Hat applies security patches
              as sequential releases (.rhlw suffix).
            </p>
          ) : (
            <p>
              This package has been rebuilt from source by Red Hat with no modifications. Multiple
              upstream versions are available, each verified end-to-end through the Red Hat build
              pipeline.
            </p>
          )}
        </Content>
      </Stack>
      {hasRelease ? (
        <Stack hasGutter>
          <Title headingLevel='h2' size='lg'>
            Secured by Red Hat
          </Title>
          <Flex gap={{ default: 'gapSm' }}>
            <FlexItem>
              <Tooltip content='SLSA (Supply-chain Levels for Software Artifacts) Level 3 means the build was fully automated on a hardened, isolated platform. A signed provenance attestation documents the entire build process and is cryptographically verifiable.'>
                <Label color='blue' icon={<CheckCircleIcon />}>
                  SLSA Level 3
                </Label>
              </Tooltip>
            </FlexItem>
            <FlexItem>
              <Tooltip content='This artifact is cryptographically signed by Red Hat using Sigstore/cosign with HSM-backed keys. You can run cosign verify to confirm it came from Red Hat&apos;s build pipeline and has not been tampered with.'>
                <Label color='blue' icon={<CheckCircleIcon />}>
                  Sigstore/cosign signed
                </Label>
              </Tooltip>
            </FlexItem>
            <FlexItem>
              <Tooltip content='A CycloneDX Software Bill of Materials is delivered automatically alongside every artifact — a machine-readable inventory of all dependencies, versions, and licenses. Supports DORA, NIS2, EU CRA, and FDA SBOM compliance requirements.'>
                <Label color='blue' icon={<CheckCircleIcon />}>
                  CycloneDX SBOM
                </Label>
              </Tooltip>
            </FlexItem>
          </Flex>
          <Content>
            <p>
              Every artifact in the Lightwell Validated catalog carries SLSA Level 3 build
              provenance attestation — built on a hardened, tamper-resistant platform and
              cryptographically signed by Red Hat.
            </p>
          </Content>
        </Stack>
      ) : null}
      <Stack hasGutter>
        <Title headingLevel='h2' size='lg'>
          How to use
        </Title>
        <Content>
          {repository ? (
            <span>
              First,{' '}
              <ConnectRepositoryModal
                repository={{
                  uuid: repository.uuid,
                  name: repository.name,
                  published_distribution_url: sourceUrl,
                  content_type: repository.content_type,
                }}
              >
                <Button variant='link' isInline>
                  {isMaven
                    ? 'configure your build tool (Maven, Gradle, Artifactory, or Nexus)'
                    : 'configure your build tool (pip, Pipenv, Poetry, Artifactory, or Nexus)'}
                </Button>
              </ConnectRepositoryModal>{' '}
              to use this repository.
            </span>
          ) : (
            <span>
              {isMaven
                ? 'First, configure your build tool (Maven, Gradle, Artifactory, or Nexus) to use this repository.'
                : 'First, configure your build tool (pip, Pipenv, Poetry, Artifactory, or Nexus) to use this repository.'}
            </span>
          )}
        </Content>
        <Tabs
          activeKey={activeTabKey}
          onSelect={(_, eventKey) => setActiveTabKey(eventKey as string)}
          aria-label='Package dependency snippets'
          ouiaId='lightwell-package-dependency-tabs'
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.eventKey}
              eventKey={tab.eventKey}
              title={<TabTitleText>{tab.title}</TabTitleText>}
              tabContentRef={tabRefs[tab.eventKey]}
              ouiaId={`lightwell-dependency-tab-${tab.eventKey}`}
            />
          ))}
        </Tabs>
        {tabs.map((tab, index) => (
          <TabContent
            key={tab.eventKey}
            eventKey={tab.eventKey}
            id={`lightwell-dependency-panel-${tab.eventKey}`}
            aria-label={tab.title}
            ref={tabRefs[tab.eventKey]}
            hidden={index > 0}
            className={spacing.ptSm}
          >
            {renderTabPanel(tab)}
          </TabContent>
        ))}
      </Stack>
    </Flex>
  );
};

export default PackageOverviewTab;
