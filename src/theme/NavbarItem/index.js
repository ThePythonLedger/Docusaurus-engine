import React from 'react';
import NavbarItem from '@theme-original/NavbarItem';
import GitHubConnectButton from '@site/src/components/GitHubConnectButton';

export default function NavbarItemWrapper(props) {
  if (props.type === 'custom-github-connect') {
    return <GitHubConnectButton {...props} />;
  }
  return (
    <>
      <NavbarItem {...props} />
    </>
  );
}
