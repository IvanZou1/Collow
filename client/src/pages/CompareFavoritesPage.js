import { useEffect, useState } from 'react';
import { Box, Container, Checkbox, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { formatCountyName} from '../helpers/formatter';
import {Bar, BarChart, Legend,  ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
const config = require('../config.json');

export default function CompareFavoritesPage({favorites, setFavorites}) {
    // The earliest and latest dates in our dataset
    const earliest = 201708;
    const latest = 202302;
    // Array with all the years between earliest and latest
    const years = [];
    for (let i = latest; i >= earliest; i -= 100) {
        // Since of dates are of the form YYYYMM, we divide by 100 to get the year and increment by 100 to get the next year.
        years.push(Math.trunc(i / 100));
    }
    // States to keep track of the date of the data that will be used to query (initially 02/2023)
    const [month, setMonth] = useState("02");
    const [year, setYear] = useState(years[0]);
    // State to keep track of data of ALL favorites
    const[data, setData] = useState([]);
    // State to keep track of the counties that the user wants to compare
    const [counties, setCounties] = useState([]);
    // State to keep track of which attribute the user wants to see
    const [attribute, setAttribute] = useState("Average_Price");

    // A useEffect hook to get the county_metrics of all favorited countiies from the date the user specified
    useEffect(() => {
        // Create a string to represent the array and pass it to the route to fetch info
        const favoriteIds = "(" + favorites.map((id) => `${id}`).join(',') + ")";
        fetch(`http://${config.server_host}:${config.server_port}/county_metrics_by_date/${favoriteIds}/${parseInt(year + month)}`)
        .then(res => res.json())
        .then(resJson => {
            const newData = resJson.map((county) => (
                { 
                    id: county.id, 
                    Name: formatCountyName(county.Name), 
                    Average_Price: county.Average,
                    Median_Price: county.Median,
                    Active_Listings: county.Active,
                    Total_Listings: county.Total,
                    Median_Price_Per_Square_Foot: county.Square_Price,
                    Median_Square_Feet: county.Square_Feet 
                }));
            setData(newData);
        });
    }, [favorites, month, year])

    // Function to update the selected counties based on whether the county was already selected or not
    const updateCountiesToCompare = (id) => {
        if (counties.includes(id)) {
            setCounties(counties.filter((countyId) => countyId !== id));
        } else {
            setCounties([...counties, id]);
        }
    }
    
    // Function to get the BarChart
    const getChart = (chartData) => {
        return (
            <ResponsiveContainer height={500}>
                <BarChart data={chartData} style={{width: '1100px'}}>
                    <XAxis dataKey="Name"></XAxis>
                    <YAxis width={70}></YAxis>
                    <Legend></Legend>
                    <Tooltip></Tooltip>
                    <Bar dataKey={attribute} fill='#82CA9D' maxBarSize={25}/>
                </BarChart>
            </ResponsiveContainer>
        )
    }

    return (
        <Container>
            {/*Display text based on how many favorites the user has */}
            {favorites.length <= 1 ? 
                (<Typography variant='h4' color={'darkgreen'} style={{marginTop:'45px', marginBottom: '40px'}}>
                    You don't have enough favorites!
                 </Typography>) :
                 (<Box>
                    <Grid container spacing={4} direction={'row'} wrap='nowrap' alignItems={"center"} style={{marginBottom: '40px'}}>
                        <Grid item xs={6}>
                                <Typography variant='h4' color={'darkgreen'} style={{marginTop:'35px', marginBottom: '5px'}}>
                                    Select at least 2 counties to compare!
                                </Typography>
                        </Grid>
                        {/*Drop down boxes to select the month and year for our data*/}
                        <Grid item xs={6}>
                            <FormControl variant="filled" sx={{minWidth: 120}}>
                                <InputLabel>Month</InputLabel>
                                    <Select
                                        onChange={(e) => setMonth(e.target.value)}
                                        label="Month"
                                        defaultValue={"02"}   
                                    >
                                        <MenuItem value={"01"}>Jan</MenuItem>
                                        <MenuItem value={"02"}>Feb</MenuItem>
                                        <MenuItem value={"03"}>Mar</MenuItem>
                                        <MenuItem value={"04"}>Apr</MenuItem>
                                        <MenuItem value={"05"}>May</MenuItem>
                                        <MenuItem value={"06"}>Jun</MenuItem>
                                        <MenuItem value={"07"}>Jul</MenuItem>
                                        <MenuItem value={"08"}>Aug</MenuItem>
                                        <MenuItem value={"09"}>Sep</MenuItem>
                                        <MenuItem value={"10"}>Oct</MenuItem>
                                        <MenuItem value={"11"}>Nov</MenuItem>
                                        <MenuItem value={"12"}>Dec</MenuItem>
                                        
                                    </Select>
                                </FormControl>
                            <FormControl variant="filled" sx={{minWidth: 120}}>
                                <InputLabel>Year</InputLabel>
                                <Select
                                    onChange={(e) => setYear(e.target.value)}
                                    label="Year"    
                                    defaultValue={2023}
                                >
                                    {years.map(
                                        (x) => <MenuItem value={x}>{x}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            
                        </Grid>
                        <Grid item xs={6}>
                            {/*Drop down boxes to select which attribute to display on the bar chart*/}
                            <FormControl variant="filled" sx={{minWidth: 120}}>
                                <InputLabel>Attribute</InputLabel>
                                    <Select
                                        onChange={(e) => setAttribute(e.target.value)}
                                        label="Attribute"
                                        defaultValue={"Average_Price"}   
                                    >
                                        <MenuItem value={"Average_Price"}>Average Price</MenuItem>
                                        <MenuItem value={"Median_Price"}>Median Price</MenuItem>
                                        <MenuItem value={"Active_Listings"}>Active Listings</MenuItem>
                                        <MenuItem value={"Total_Listings"}>Total Listings</MenuItem>
                                        <MenuItem value={"Median_Price_Per_Square_Foot"}>Median Price Per Square Foot</MenuItem>
                                        <MenuItem value={"Median_Square_Feet"}>Median Square Feet</MenuItem>
                                    </Select>
                                </FormControl>
                        </Grid>
                    </Grid>
                    {/*Create the checkboxes, which will be checked based on whether or not the county is in counties*/}
                    {data.map((county) => 
                        <FormControlLabel
                            control={<Checkbox 
                                        checked={counties.includes(county.id)} 
                                        onChange={() => updateCountiesToCompare(county.id)}>
                                     </Checkbox>}
                            label={county.Name}
                            labelPlacement='start'
                        />
                    )}
                    {/*Render the graph only when at least 2 counties are selected. Due to a bug, BarChart needs >= 2 data points*/}
                    {counties.length >= 2 && getChart(data.filter((county) => counties.includes(county.id)))}
                  </Box>
                 )}
        </Container>
    )
}