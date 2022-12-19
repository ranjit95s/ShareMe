import React,{useState, useEffect} from 'react'
import {useParams} from 'react-router-dom';
import { Client } from '../client';
import MasonryLayout from './MasonryLayout';
import Spinner from './Spinner';
import { feedQuery, searchQuery} from '../utils/data';

const Feed = () => {
    const [pins, setPins] = useState();
    const [loading, setLoading] = useState(false);
    const { categoryId } = useParams();
    useEffect(() => {
        if (categoryId) {
          setLoading(true);
          const query = searchQuery(categoryId);
          Client.fetch(query).then((data) => {
            setPins(data);
            setLoading(false);
          });
        } else {
          setLoading(true);
          Client.fetch(feedQuery).then((data) => {
            setPins(data);
            setLoading(false);
          });
        }
      }, [categoryId]);


    const ideaName = categoryId || 'new';
    if(loading){
        return (
          <Spinner message={`We are adding ${ideaName} ideas to your feed!`} />
    );}
    
        if(!pins?.length){
            return <h2>No Pins available !</h2>
    }

    return (
        <div>
            {pins && (
                <MasonryLayout pins={pins} />
            )}
        </div>
    );
};

export default Feed
