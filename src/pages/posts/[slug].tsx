import { GetServerSideProps } from 'next';
import styles from './post.module.scss';

import { getPrismicClient } from '../../services/prismic'
import { RichText } from 'prismic-dom';

import Head from 'next/head';
import Image from 'next/image'
import { title } from 'process';

interface PostProps{
    post:{
        slug:string;
        title: string;
        description:string;
        cover:string;
        updatedAt:string;

    }
}

export default function Post({post }: PostProps) {
    return (
        <>
            <Head>
               <title>{post.title}</title> 
            </Head>
            <main className={styles.container}>
            <article className={styles.post}>
            <Image
            quality={100}
            src={post.cover}
            width={720}
            height={410}
            alt={post.title}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+H+3HgAFQAJd4Umq7wAAAABJRU5ErkJggg=="
            />
            <h1>{post.title}</h1>
            <time>{post.updatedAt}</time>
            <div className={styles.postContent} dangerouslySetInnerHTML={{__html: post.description}}></div>


            </article>
            </main>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
    if (!params || !params.slug) {
        return {
            notFound: true,
        }
    }

    const { slug } = params;
    const prismic = getPrismicClient(req);

    const response = await prismic.getByUID('post', String(slug), {});

    if (!response) {
        return {
            redirect: {
                destination: '/posts',
                permanent: false
            }
        }
    }

    const lastPublicationDate = response.last_publication_date ? new Date(response.last_publication_date) : null;

    const post = {
        slug: slug,
        title: RichText.asText(response.data.title),
        description: RichText.asHtml(response.data.description),
        cover: response.data.cover.url,
        updateAt: lastPublicationDate ? lastPublicationDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }) : null
    }

    return {
        props: {
            post: post 
        }
    }
}
