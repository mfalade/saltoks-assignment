import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Error from 'app/components/error';
import Loading from 'app/components/loading';
import Readme from 'app/components/readme';
import { useTimeZone, useQueryParams } from 'app/hooks';
import {
  fetchRepositoryDetails,
  repositorySelector,
} from 'app/store/repository';

import { getRelativeCreationTime } from './helpers';
import { RepoContainer, Paragraph, Highlight, Header } from './styles';

function Repo() {
  const dispatch = useDispatch();
  const repository = useSelector(repositorySelector);
  const timeZone = useTimeZone();
  const { queryParams, hasParsedQueryParams } = useQueryParams();

  const repoUrl = queryParams.name;
  const { data, readme, isFetching, error } = repository;
  const created = getRelativeCreationTime(data.created_at, timeZone);
  const showRepositoryDetails = !error && !isFetching && repoUrl;

  useEffect(() => {
    if (repoUrl) {
      dispatch(fetchRepositoryDetails(repoUrl));
    }
  }, [dispatch, repoUrl]);

  const renderedItems = [
    { label: 'Name', value: data.full_name },
    { label: 'Description', value: data.description },
    { label: 'Language', value: data.language },
    { label: 'Is Private', value: String(data.private) },
    { label: 'Created', value: created },
    { label: 'Watchers count', value: data.watchers_count },
    { label: 'Forks count', value: data.forks_count },
    { label: 'Open issues count', value: data.open_issues_count },
  ];

  if (hasParsedQueryParams && !repoUrl) {
    return <Error visible message="No repository specified!" />;
  }

  return (
    <RepoContainer>
      <Header>
        <Paragraph>
          <Link to="/">Back to Home Page</Link>
        </Paragraph>
        {showRepositoryDetails && (
          <Paragraph>
            <a href={data.html_url} target="_blank" rel="noopener noreferrer">
              View on Github
            </a>
          </Paragraph>
        )}
      </Header>
      <br />
      <Loading visible={isFetching} />
      <Error visible={Boolean(error)} message={error} />
      {showRepositoryDetails && (
        <article data-cy="repository-details">
          {renderedItems.map((item) => (
            <Paragraph key={item.label}>
              {item.label}: <Highlight>{item.value}</Highlight>
            </Paragraph>
          ))}
          <Readme source={readme} />
        </article>
      )}
    </RepoContainer>
  );
}

export default Repo;
