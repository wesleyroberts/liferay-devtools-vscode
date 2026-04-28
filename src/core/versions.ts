export type LiferayEdition = 'dxp' | 'community';

export interface DockerImageOption {
  repository: string;
  tag: string;
}

export interface ProductVersionOption {
  label: string;
  value: string;
  dockerImage: DockerImageOption;
}

export const COMMUNITY_VERSIONS: ProductVersionOption[] = [
  {
    label: '7.4 GA132',
    value: 'portal-7.4-ga132',
    dockerImage: {
      repository: 'liferay/portal',
      tag: '7.4.3.132-ga132'
    }
  },
  {
    label: '7.4 GA129',
    value: 'portal-7.4-ga129',
    dockerImage: {
      repository: 'liferay/portal',
      tag: '7.4.3.129-ga129'
    }
  }
];

export const DXP_VERSIONS: ProductVersionOption[] = [
  {
    label: '7.4 U102',
    value: 'dxp-7.4-u102',
    dockerImage: {
      repository: 'liferay/dxp',
      tag: '7.4.13-u102'
    }
  },
  {
    label: '7.4 U98',
    value: 'dxp-7.4-u98',
    dockerImage: {
      repository: 'liferay/dxp',
      tag: '7.4.13-u98'
    }
  }
];
