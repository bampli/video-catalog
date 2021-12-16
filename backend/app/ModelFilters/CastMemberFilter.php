<?php 

namespace App\ModelFilters;

use EloquentFilter\ModelFilter;

class CastMemberFilter extends ModelFilter
{
    protected $sortable = ['name', 'type', 'created_at'];

    public function search($search)
    {
        $this->query->where('name', 'LIKE', "%$search%");
    }
}
